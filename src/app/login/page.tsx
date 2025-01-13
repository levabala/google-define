export default function Login() {
    return (
        <div className="flex flex-col gap-1">
            <h1 className="text-white">Login</h1>
            <form action="/api/login" method="POST">
                <input
                    type="text"
                    name="token"
                    placeholder="token"
                    className="w-48 bg-gray-800 text-white border border-gray-500 focus-visible:outline-gray-800"
                />
                <button type="submit" className="bg-gray-300 p-1 ml-1">Login</button>
            </form>
        </div>
    );
}
