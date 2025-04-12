const AuthImagePattern = ({ title, subtitle }) => {
    return (
      <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-gray-900 to-black p-12">
        <div className="max-w-md text-center text-gray-300">
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                className={`aspect-square rounded-2xl ${
                  i % 2 === 0 ? "bg-purple-600 animate-pulse" : "bg-cyan-500"
                }`}
              />
            ))}
          </div>
          <h2 className="text-2xl font-bold mb-4 text-white">{title}</h2>
          <p className="text-gray-400">{subtitle}</p>
        </div>
      </div>
    );
  };
  
  export default AuthImagePattern;