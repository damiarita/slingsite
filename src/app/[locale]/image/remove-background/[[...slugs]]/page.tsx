import ToolRoute, {
  getToolMetadata,
  getToolStaticParams,
  type ToolRouteProps,
} from '@/components/tool-route';

export const generateStaticParams = () =>
  getToolStaticParams('remove-background', 'image');

export const generateMetadata = (props: ToolRouteProps) =>
  getToolMetadata('remove-background', 'image', props);

export default function Page({ params }: ToolRouteProps) {
  return <ToolRoute tool="remove-background" type="image" params={params} />;
}
