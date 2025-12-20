export default function SignupPage() {
  const fieldClassName =
    "bg-indigo-300 ring-indigo-600 ring-1 text-indigo-950 text-center rounded-xl";

  return (
    <div>
      <div className="min-h-screen flex items-center justify-center bg-linear-to-tr from-blue-200 to-indigo-500">
        <div className="bg-linear-to-br from-gray-700 to-black rounded-xl shadow-2xl p-8 ring-2 ring-indigo-700">
          <h1 className="text-center font-bold text-indigo-500 text-3xl">
            Sign Up
          </h1>
          <div className="flex flex-col gap-5">
            <div className="flex flex-row gap-4">
              <div>
                <p className="text-left text-indigo-800">First name</p>
                <input className={fieldClassName}></input>
              </div>
              <div>
                <p className="text-left text-indigo-800">Last name</p>
                <input className={fieldClassName}></input>
              </div>
            </div>
            <div>
              <p className="text-left text-indigo-800">Username</p>
              <input className={fieldClassName}></input>
            </div>
            <div className="flex flex-row gap-4">
              <div>
                <p className="text-left text-indigo-800">Password</p>
                <input type="password" className={fieldClassName}></input>
              </div>
              <div>
                <p className="text-left text-indigo-800">re-enter Password</p>
                <input type="password" className={fieldClassName}></input>
              </div>
            </div>
            <div>
              <p className="text-left text-indigo-800">Email address</p>
              <input className={fieldClassName}></input>
            </div>
            <div>
              <p className="text-left text-indigo-800">Phone number</p>
              <input className={fieldClassName}></input>
            </div>
            <div>
              <p className="text-left text-indigo-800">Shipping address</p>
              <input className={fieldClassName}></input>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
