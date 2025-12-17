interface BreadcrumbProps {
  make: string;
  model: string;
  year: number;
}

export default function Breadcrumb({ make, model, year }: BreadcrumbProps) {
  return (
    <div className="mb-6">
      <nav className="flex text-gray-500 ">
        <a href="/" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
          Home
        </a>
        <span className="mx-2">/</span>
        <a href="/cars" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
          Cars
        </a>
        <span className="mx-2">/</span>
        <h2 className="text-gradient font-semibold text-lg">
          {make} {model} {year}
        </h2>
      </nav>
    </div>
  );
}