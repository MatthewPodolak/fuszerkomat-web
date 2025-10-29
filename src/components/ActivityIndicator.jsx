export default function ActivityIndicator({
  size = "medium", // "small" | "medium" | "large"
  color = "accent",
}) {
  const sizeClasses = {
    small: "h-4 w-4 border-2",
    medium: "h-8 w-8 border-4",
    large: "h-12 w-12 border-4",
  };

  const spinnerSize = sizeClasses[size] || sizeClasses.medium;

  return (
    <div className="flex justify-center items-center">
      <div
        className={`${spinnerSize} border-${color} border-t-transparent rounded-full animate-spin`}
      ></div>
    </div>
  );
}