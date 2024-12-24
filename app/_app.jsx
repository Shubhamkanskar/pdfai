import { Toaster } from "sonner";

const CustomToaster = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: "#ffffff",
          color: "#181818",
          border: "1px solid rgba(255,255,255,0.1)",
          fontSize: "10px",
          padding: "8px 12px",
          maxWidth: "200px",
        },
        duration: 2000,
      }}
    />
  );
};
export default CustomToaster;
