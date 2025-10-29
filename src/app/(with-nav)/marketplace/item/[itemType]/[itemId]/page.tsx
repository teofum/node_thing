import { getItem } from "../../actions";

type ItemDetailPageProps = {
  params: {
    itemType: "shader" | "project";
    itemId: string;
  };
};

export default async function ItemDetailPage({ params }: ItemDetailPageProps) {
  const { itemType, itemId } = params;

  const item = getItem(itemId, itemType);

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <p>TODO</p>
      <p>{itemType}</p>
      <p>{itemId}</p>
    </div>
  );
}
