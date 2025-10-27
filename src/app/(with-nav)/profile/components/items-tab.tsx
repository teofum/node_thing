import * as Tabs from "@radix-ui/react-tabs";
import { forwardRef } from "react";
import { Button } from "@/ui/button";
import RatingCard from "./ratingcard";
import type { UserRatingsDisplay } from "../page";

type UserShaderDisplay = {
  id: string;
  title: string;
  averageRating: number | null;
  ratingCount: number | null;
  category: {
    name: string;
  };
};

type ItemTabsProps = {
  shadersList: UserShaderDisplay[];
  projectsList: UserShaderDisplay[];
  shadersRatingsList: UserRatingsDisplay[];
  projectsRatingsList: UserRatingsDisplay[];
} & React.HTMLAttributes<HTMLDivElement>;

const ItemsTab = forwardRef<HTMLDivElement, ItemTabsProps>(
  ({ shadersList, projectsList, shadersRatingsList }, forwardedRef) => {
    // TODO subir filtro de componentes

    // const purchasedCards =
    //   shadersList.length > 0 ? (
    //     shadersList.map((shader) => (
    //       <RatingCard
    //         key={shader.id}
    //         id={shader.id}
    //         title={shader.title}
    //         category={shader.category.name}
    //         averageRating={shader.averageRating}
    //         userRating={
    //           shadersRatingsList.find((r) => r.shaderId === shader.id) ?? null
    //         }
    //         ratingCount={shader.ratingCount ?? 0}
    //       />
    //     ))
    //   ) : (
    //     <p className="text-white/40">
    //       {"You haven't purchased any shaders yet"}
    //     </p>
    //   );

    const shadersCards =
      shadersList.length > 0 ? (
        shadersList.map((shader) => (
          <RatingCard
            key={shader.id}
            id={shader.id}
            title={shader.title}
            category={shader.category.name}
            averageRating={shader.averageRating}
            userRating={
              shadersRatingsList.find((r) => r.shaderId === shader.id) ?? null
            }
            ratingCount={shader.ratingCount ?? 0}
          />
        ))
      ) : (
        <p className="text-white/40">
          {"You haven't purchased any shaders yet"}
        </p>
      );

    // TODO para projects
    const projectsCards =
      projectsList.length > 0 ? (
        projectsList.map((shader) => (
          <RatingCard
            key={shader.id}
            id={shader.id}
            title={shader.title}
            category={shader.category.name}
            averageRating={shader.averageRating}
            userRating={
              shadersRatingsList.find((r) => r.shaderId === shader.id) ?? null
            }
            ratingCount={shader.ratingCount ?? 0}
          />
        ))
      ) : (
        <p className="text-white/40">
          {"You haven't published any shaders yet"}
        </p>
      );

    return (
      <div ref={forwardedRef}>
        <p className="text-lg p-2 mb-3">Shaders</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shadersCards}
        </div>
        <p className="text-lg p-2 mt-5 mb-3">Projects</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projectsCards}
        </div>
        <p className="text-lg p-2 mt-5 mb-3">Groups</p>
        TODO
      </div>
    );
  },
);
ItemsTab.displayName = "ItemsTab";

export default ItemsTab;
