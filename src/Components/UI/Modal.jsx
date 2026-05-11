// import Modal from "../../Components/UI/Modal";
import Icon from "./Icon";

export default function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-7 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-black text-base">{title}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <Icon name="x" className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
