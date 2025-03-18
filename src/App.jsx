function App() {

  return (
    <>
      <div className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-50">
        <h1 className="text-blue-500 text-2xl font-bold">Facebook</h1>
        <input
          type="text"
          placeholder="Search..."
          className="border rounded-full px-4 py-2 w-1/3"
        />
        <div className="flex space-x-4">
          <button className="bg-blue-500 text-white px-4 py-2 rounded-full">Login</button>
          <button className="bg-gray-300 px-4 py-2 rounded-full">Signup</button>
        </div>
      </div>
    </>
  )
}

export default App
