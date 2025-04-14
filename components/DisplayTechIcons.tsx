import Image from "next/image";

import { getTechLogos } from "@/lib/utils";

const DisplayTechIcons = async ({
  techStack,
  className,
}: {
  techStack: Array<string>;
  className?: string;
}) => {
  const techIcons = await getTechLogos(techStack);
  const displayableTechs = techIcons.slice(0, 3);
  const remainingTechs = techStack.length - displayableTechs.length;

  return (
    <div className={`flex gap-1 ${className}`}>
      {displayableTechs.map(({ tech, url }) => (
        <div key={tech} className="group relative" title={tech}>
          <div className="bg-dark-300 rounded-full p-2 transition-all duration-200 hover:bg-dark-200 shadow-sm border border-light-800/10">
            <Image
              src={url}
              alt={tech}
              width={20}
              height={20}
              className="size-5"
            />
          </div>
          <span className="tech-tooltip absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
            {tech}
          </span>
        </div>
      ))}

      {remainingTechs > 0 && (
        <div className="bg-dark-300 rounded-full p-2 text-xs font-medium text-light-100 flex items-center justify-center min-w-10 shadow-sm border border-light-800/10">
          +{remainingTechs}
        </div>
      )}
    </div>
  );
};

export default DisplayTechIcons;
