export default function InputBox({
  type = "text",
  name,
  placeholder,
  ...props
}) {
  return (
    <div className="mb-2">
      <input
        id={name}
        type={type}
        name={name}
        aria-label={props["aria-label"] || placeholder}
        placeholder={placeholder}
        {...props}
        className="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:text-white"
      />
    </div>
  );
}
