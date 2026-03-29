const users = ["You", "Rahul", "Aman", "Priya", "Neha", "Karan"];

export default function Stories() {
  return (
    <div className="flex gap-4 overflow-x-auto p-3 bg-zinc-900 rounded-xl border border-zinc-800">
      {users.map((user, i) => (
        <div key={i} className="flex flex-col items-center cursor-pointer group">
          
          <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-pink-500 to-yellow-500">
            <div className="w-full h-full bg-zinc-900 rounded-full flex items-center justify-center">
              <span className="text-sm">{user[0]}</span>
            </div>
          </div>

          <p className="text-xs mt-1 group-hover:text-pink-400">{user}</p>
        </div>
      ))}
    </div>
  );
}