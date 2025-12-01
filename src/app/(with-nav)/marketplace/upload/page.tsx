import { getCreatedShaders, getUserProjects } from "./actions";
import { getCategories } from "../actions";
import PublishMenu from "./components/publish-menu";

export default async function UploadPage() {
  const [projects, shaders, categories] = await Promise.all([
    getUserProjects(),
    getCreatedShaders(),
    getCategories(),
  ]);

  return (
    <>
      <PublishMenu
        projects={projects}
        shaders={shaders}
        categories={categories}
      />
    </>
  );
}
