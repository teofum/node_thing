import { getUserProjects } from "./actions";
import PublishMenu from "./components/publish-menu";

export default async function UploadPage() {
  const projects = await getUserProjects();

  return (
    <>
      <PublishMenu projects={projects} />
    </>
  );
}
