export default function Loader() {
  return (
    <div className="bounce-loader size-16 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-75 flex items-center justify-center gap-1">
      <div className="bounce-loader-1 size-1.5 bg-white rounded-full"></div>
      <div className="bounce-loader-2 size-1.5 bg-white rounded-full"></div>
      <div className="bounce-loader-3 size-1.5 bg-white rounded-full"></div>
    </div>
  );
}
