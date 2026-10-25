import ToolRoute, {
  getToolMetadata,
  getToolStaticParams,
  type ToolRouteProps,
} from '@/components/tool-route';

export const generateStaticParams = () =>
  getToolStaticParams('resize', 'video');

export const generateMetadata = (props: ToolRouteProps) =>
  getToolMetadata('resize', 'video', props);

export default function Page({ params }: ToolRouteProps) {
  return <ToolRoute tool="resize" type="video" params={params} />;
}
