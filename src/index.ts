import app from "./core/app";

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
