import ToolRoute, {
  getToolMetadata,
  getToolStaticParams,
  type ToolRouteProps,
} from '@/components/tool-route';

export const generateStaticParams = () =>
  getToolStaticParams('resize', 'image');

export const generateMetadata = (props: ToolRouteProps) =>
  getToolMetadata('resize', 'image', props);

export default function Page({ params }: ToolRouteProps) {
  return <ToolRoute tool="resize" type="image" params={params} />;
}
