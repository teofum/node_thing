import { getCreatedShaders, getUserProjects } from "./actions";
import PublishMenu from "./components/publish-menu";

export default async function UploadPage() {
  const projects = await getUserProjects();
  const shaders = await getCreatedShaders();

  return (
    <>
      <PublishMenu projects={projects} shaders={shaders} />
    </>
  );
}
