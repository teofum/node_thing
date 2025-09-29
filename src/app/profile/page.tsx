import { Button, LinkButton } from "@/ui/button";
import { LuArrowLeft } from "react-icons/lu";
import { signOutAction } from "../auth/actions";
import RatingShaderCard from "../components/profile/rating-shadercard";
import { getUserShaders } from "./actions";

export default async function ProfilePage() {
  // TODO hacer manejo de redirigir a login si no inició sesión

  const userShaders = await getUserShaders();

  return (
    <>
      <div className="min-h-screen bg-neutral-900 relative">
        <LinkButton
          variant="ghost"
          href="/"
          size="md"
          className="absolute top-4 left-4"
        >
          <LuArrowLeft />
          Back
        </LinkButton>

        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h1 className="text-3xl font-bold text-white">
                  TODO username...
                </h1>
              </div>
              <div className="flex gap-4">
                <form action={signOutAction} className="inline">
                  <Button type="submit" variant="outline">
                    Logout
                  </Button>
                </form>
              </div>
            </div>

            {/* task */}
            {/* TODO pulir UI */}
            {/* podría hasta ser una sidebar que sirva como menú y que de desplace a la sección que toques */}
            <div className="flex gap-4 mb-6">
              {/* TODO */}
              <Button variant="default">User data</Button>
              {/* TODO */}
              <Button variant="default">My Shaders</Button>
            </div>
            {/* task */}

            <div className="bg-black/50 rounded-2xl p-4 min-h-[600px] mb-3">
              <h2 className="text-xl font-semibold mb-4">User...</h2>
              TODO...
            </div>

            <div className="bg-black/50 rounded-2xl p-4 min-h-[600px] mb-3">
              <h2 className="text-xl font-semibold mb-4">My Shaders</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userShaders.map((shader) => (
                  <RatingShaderCard
                    key={shader.id}
                    id={shader.id}
                    title={shader.title}
                    category={shader.category.name}
                    average_rating={shader.average_rating}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
