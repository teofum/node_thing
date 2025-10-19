import * as Tabs from "@radix-ui/react-tabs";
import { forwardRef } from "react";
import { Button } from "@/ui/button";
import RatingCard from "./ratingcard";
import type { UserRatingsDisplay } from "../page";

type UserShaderDisplay = {
  id: string;
  title: string;
  category: {
    name: string;
  };
};

type ShadersTabProps = {
  shaderList: UserShaderDisplay[];
  publishList: UserShaderDisplay[];
  ratingsList: UserRatingsDisplay[];
} & React.HTMLAttributes<HTMLDivElement>;

const ShadersTab = forwardRef<HTMLDivElement, ShadersTabProps>(
  (
    { shaderList, publishList, ratingsList, className, ...props },
    forwardedRef,
  ) => {
    const purchasedCards =
      shaderList.length > 0 ? (
        shaderList.map((shader) => (
          <RatingCard
            key={shader.id}
            id={shader.id}
            title={shader.title}
            category={shader.category.name}
            averageRating={null}
            userRating={
              ratingsList.find((r) => r.shaderId === shader.id) ?? null
            }
            ratingCount={0}
            trigger={<Button variant="outline">test</Button>}
          />
        ))
      ) : (
        <p className="text-white/40">
          {"You haven't purchased any shaders yet"}
        </p>
      );

    const publishedCards =
      publishList.length > 0 ? (
        publishList.map((shader) => (
          <RatingCard
            key={shader.id}
            id={shader.id}
            title={shader.title}
            category={shader.category.name}
            averageRating={null}
            userRating={
              ratingsList.find((r) => r.shaderId === shader.id) ?? null
            }
            ratingCount={0}
            trigger={null}
          />
        ))
      ) : (
        <p className="text-white/40">
          {"You haven't published any shaders yet"}
        </p>
      );

    const subtabStyle =
      "flex h-[40px] hover:bg-white/5 flex-1 cursor-default select-none items-center justify-center px-4 font-medium text-sm leading-none outline-none first:rounded-tl-lg last:rounded-tr-lg data-[state=active]:border-teal-500 data-[state=active]:border-b-2 transition data-[state=active]:focus:relative";

    return (
      <div className={className} {...props} ref={forwardedRef}>
        <Tabs.Root defaultValue="published">
          <Tabs.List className="flex shrink-0 border border-white/10 rounded-lg mb-6">
            <Tabs.Trigger className={subtabStyle} value="published">
              Published
            </Tabs.Trigger>
            <Tabs.Trigger className={subtabStyle} value="library">
              Library
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="published">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publishedCards}
            </div>
          </Tabs.Content>
          <Tabs.Content value="library">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {purchasedCards}
            </div>
          </Tabs.Content>
        </Tabs.Root>
      </div>
    );
  },
);
ShadersTab.displayName = "ShadersTab";

export default ShadersTab;
