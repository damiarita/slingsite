import ToolRoute, {
  getToolMetadata,
  getToolStaticParams,
  type ToolRouteProps,
} from '@/components/tool-route';

export const generateStaticParams = () =>
  getToolStaticParams('format', 'image');

export const generateMetadata = (props: ToolRouteProps) =>
  getToolMetadata('format', 'image', props);

export default function Page({ params }: ToolRouteProps) {
  return <ToolRoute tool="format" type="image" params={params} />;
}
