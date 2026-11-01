import ToolRoute, {
  getToolMetadata,
  getToolStaticParams,
  type ToolRouteProps,
} from '@/components/tool-route';

export const generateStaticParams = () => getToolStaticParams('alt', 'image');

export const generateMetadata = (props: ToolRouteProps) =>
  getToolMetadata('alt', 'image', props);

export default function Page({ params }: ToolRouteProps) {
  return <ToolRoute tool="alt" type="image" params={params} />;
}
