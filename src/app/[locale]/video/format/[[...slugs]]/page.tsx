import ToolRoute, {
  getToolMetadata,
  getToolStaticParams,
  type ToolRouteProps,
} from '@/components/tool-route';

export const generateStaticParams = () =>
  getToolStaticParams('format', 'video');

export const generateMetadata = (props: ToolRouteProps) =>
  getToolMetadata('format', 'video', props);

export default function Page({ params }: ToolRouteProps) {
  return <ToolRoute tool="format" type="video" params={params} />;
}
