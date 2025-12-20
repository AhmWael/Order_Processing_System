export default function LoginPage() {
  return (
    <div>
      <div className="min-h-screen flex items-center justify-center bg-linear-to-tr from-blue-200 to-indigo-500">
        <div className="bg-linear-to-br from-gray-700 to-black rounded-xl shadow-2xl p-8 ring-2 ring-indigo-700">
          <h1 className="text-center font-bold text-indigo-500 text-3xl">
            Welcome back
          </h1>
          <p className="text-center text-indigo-400 mb-7">
            Sign into your account
          </p>
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-left text-indigo-800">Username</p>
              <input className="bg-indigo-300 ring-indigo-600 ring-1 text-indigo-950 text-center"></input>
            </div>
            <div>
              <p className="text-left text-indigo-800">Password</p>
              <input
                type="password"
                className="bg-indigo-300 ring-indigo-600 ring-1 text-indigo-950 text-center"
              ></input>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
