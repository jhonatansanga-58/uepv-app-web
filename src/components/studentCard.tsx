import { HiEye, HiPencilAlt, HiBan } from "react-icons/hi";

type Props = {
  name: string;
  course: string;
};

export default function StudentCard({ name, course }: Props) {
  return (
    <div className="flex border-b border-gray-300 bg-white text-sm rounded-xl">
      <div className="flex items-center gap-4 w-1/2 px-6 py-2">
        <div className="text-lg w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold">
          {name.charAt(0)}
        </div>
        <div className="text-lg font-medium text-gray-800">{name}</div>
      </div>

      <div className="text-lg flex items-center w-1/4 px-6 py-4 text-gray-700">
        {course}
      </div>

      <div className="flex items-center justify-end w-auto px-6 py-4 gap-2">
        <button className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded">
          <HiEye className="w-5 h-5" />
        </button>
        <button className="bg-yellow-400 hover:bg-yellow-500 text-white p-2 rounded">
          <HiPencilAlt className="w-5 h-5" />
        </button>
        <button className="bg-red-500 hover:bg-red-600 text-white p-2 rounded">
          <HiBan className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
