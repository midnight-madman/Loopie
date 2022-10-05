
export function LoadingComponent({subtitle}: {subtitle?: string}) {
    return <main className="mt-16 ml-8 max-w-7xl px-4">
        <div className="mx-auto item-center text-center">
            <h1 className="text-2xl font-bold text-gray-900">
          <span className="block xl:inline">
            <p className="animate-pulse flex max-w-lg">
            Loading
          </p>
          </span>
            </h1>
            {subtitle && (
                <span className="block xl:inline">
                  <p className="flex mt-3 max-w-md text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                    {subtitle}
                  </p>
              </span>
            )}
        </div>
    </main>
}
