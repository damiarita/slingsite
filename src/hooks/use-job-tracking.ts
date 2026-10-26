import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { AnalyticsEventParams } from '@/types/analytics';
import type { Job, Task } from '@/types/job';
import type { Format } from '@/utils/formats';
import { jobIsIncomplete, jobTaskEntries } from '@/utils/jobs';
import { jobContext, sumBy, taskDetails, trackEvent } from '@/utils/analytics';

const sinceMs = (start: number) => Math.round(performance.now() - start);

const outputSize = (task: Task) =>
  task.status === 'completed' ? task.result.size : 0;

type PendingConversion = {
  compressorType: AnalyticsEventParams['conversion_started']['compressor_type'];
  jobIds: string[];
  startTime: number;
};

type FinishedJob = Pick<
  AnalyticsEventParams['job_finished'],
  | 'task_count'
  | 'completed_count'
  | 'errored_count'
  | 'input_size_bytes'
  | 'output_size_bytes'
>;

// Owns the conversion, job and task lifecycle events. Starts are marked by
// CompressorApp when they happen (start times are taken there); every other
// event is derived from the jobs' state, so the data of each task is at hand
// and the refs make every event fire once (StrictMode runs effects twice).
// Only task events describe tasks: job and conversion events add counts,
// totals and timing.
export default function useJobTracking(jobs: Job[]) {
  const conversions = useRef(new Map<string, PendingConversion>());
  const jobStartTimes = useRef(new Map<string, number>());
  const finishedJobs = useRef(new Map<string, FinishedJob>());
  // Time of the first progress message, set before the state shows it.
  const taskProgressTimes = useRef(new Map<string, number>());
  const taskStartTimes = useRef(new Map<string, number>());
  const finishedTasks = useRef(new Set<string>());

  useEffect(() => {
    for (const job of jobs) {
      if (finishedJobs.current.has(job.id)) continue;
      const entries = jobTaskEntries(job);

      for (const { configName, format, task } of entries) {
        if (task.status === 'waiting') continue;
        const details = taskDetails(job, configName, format);
        const taskId = details.task_id;
        let startTime = taskStartTimes.current.get(taskId);
        if (startTime === undefined) {
          // A task that fails before its first progress message starts now.
          startTime =
            taskProgressTimes.current.get(taskId) ?? performance.now();
          taskStartTimes.current.set(taskId, startTime);
          trackEvent({ event: 'task_started', ...details });
        }
        if (task.status === 'running' || finishedTasks.current.has(taskId)) {
          continue;
        }
        finishedTasks.current.add(taskId);
        trackEvent({
          event: 'task_finished',
          ...details,
          status: task.status,
          error_kind: task.status === 'errored' ? task.errorKind : undefined,
          output_size_bytes:
            task.status === 'completed' ? task.result.size : undefined,
          elapsed_ms: sinceMs(startTime),
        });
      }

      if (jobIsIncomplete(job)) continue;
      const completedCount = entries.filter(
        ({ task }) => task.status === 'completed',
      ).length;
      const finished: FinishedJob = {
        task_count: entries.length,
        completed_count: completedCount,
        errored_count: entries.length - completedCount,
        input_size_bytes: job.originalFile.size,
        output_size_bytes: sumBy(entries, ({ task }) => outputSize(task)),
      };
      finishedJobs.current.set(job.id, finished);
      const jobStartTime = jobStartTimes.current.get(job.id);
      trackEvent({
        event: 'job_finished',
        ...jobContext(job),
        ...finished,
        elapsed_ms:
          jobStartTime === undefined ? undefined : sinceMs(jobStartTime),
      });
    }

    // A conversion ends when each of its jobs has finished or been removed.
    const currentJobIds = new Set(jobs.map((job) => job.id));
    for (const [conversionId, conversion] of conversions.current) {
      const finished = conversion.jobIds.flatMap((id) => {
        const finishedJob = finishedJobs.current.get(id);
        return finishedJob ? [finishedJob] : [];
      });
      const removedCount = conversion.jobIds.filter(
        (id) => !finishedJobs.current.has(id) && !currentJobIds.has(id),
      ).length;
      if (finished.length + removedCount < conversion.jobIds.length) continue;
      conversions.current.delete(conversionId);
      const total = (key: keyof FinishedJob) =>
        sumBy(finished, (job) => job[key]);
      trackEvent({
        event: 'conversion_finished',
        conversion_id: conversionId,
        compressor_type: conversion.compressorType,
        job_count: conversion.jobIds.length,
        removed_count: removedCount,
        task_count: total('task_count'),
        completed_count: total('completed_count'),
        errored_count: total('errored_count'),
        input_size_bytes: total('input_size_bytes'),
        output_size_bytes: total('output_size_bytes'),
        elapsed_ms: sinceMs(conversion.startTime),
      });
    }
  }, [jobs]);

  // Call once the Start click's jobs exist, before they are rendered.
  const conversionStarted = useCallback(
    (
      params: AnalyticsEventParams['conversion_started'],
      startedJobs: Job[],
    ) => {
      conversions.current.set(params.conversion_id, {
        compressorType: params.compressor_type,
        jobIds: startedJobs.map((job) => job.id),
        startTime: performance.now(),
      });
      trackEvent({ event: 'conversion_started', ...params });
    },
    [],
  );

  // Call when the job is sent to the worker. A restart after an abort keeps
  // the first start.
  const jobStarted = useCallback((job: Job) => {
    if (jobStartTimes.current.has(job.id)) return;
    jobStartTimes.current.set(job.id, performance.now());
    trackEvent({
      event: 'job_started',
      ...jobContext(job),
      task_count: jobTaskEntries(job).length,
    });
  }, []);

  // Call on every progress message: the first one is the task's start.
  const taskProgressed = useCallback(
    (job: Job, configName: string, format: Format) => {
      const taskId = job.taskIds[configName]?.[format];
      if (taskId && !taskProgressTimes.current.has(taskId)) {
        taskProgressTimes.current.set(taskId, performance.now());
      }
    },
    [],
  );

  return useMemo(
    () => ({ conversionStarted, jobStarted, taskProgressed }),
    [conversionStarted, jobStarted, taskProgressed],
  );
}
