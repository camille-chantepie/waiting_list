export default function SocialMedia() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white">
      <h1 className="text-3xl font-bold mb-6">Connect with me</h1>
      <ul className="space-y-4">
        <li>
          <a
            href="https://www.linkedin.com/in/camille-chantepie/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-700 underline hover:text-blue-900 text-lg"
          >
            LinkedIn
          </a>
        </li>
      </ul>
    </main>
  );
}
