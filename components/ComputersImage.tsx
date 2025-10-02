import Image from "next/image";

export default function ComputersImage() {
  return (
    <Image
      src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80"
      alt="Computers on desk"
      width={400}
      height={300}
      className="rounded-2xl object-cover w-full h-full"
      priority
    />
  );
}
