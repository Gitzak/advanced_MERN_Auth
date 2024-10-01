const InputBox = ({ type, name, placeholder, onChange, onBlur, value }) => {
  return (
    <div className="mb-2">
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        onChange={onChange} // Handled by Formik
        onBlur={onBlur} // Handled by Formik
        value={value} // Handled by Formik
        className="w-full px-4 py-2 border rounded-md dark:bg-gray-800 dark:text-white"
      />
    </div>
  );
};

export default InputBox;
