import ToolRoute, {
  getToolMetadata,
  getToolStaticParams,
  type ToolRouteProps,
} from '@/components/tool-route';

export const generateStaticParams = () =>
  getToolStaticParams('thumbnail', 'video');

export const generateMetadata = (props: ToolRouteProps) =>
  getToolMetadata('thumbnail', 'video', props);

export default function Page({ params }: ToolRouteProps) {
  return <ToolRoute tool="thumbnail" type="video" params={params} />;
}
