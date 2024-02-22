import { cookies } from "next/headers";

const Profile = () => {
  const cookiesStores = cookies();
  return (
    <>
      <h1>Hello login success {cookiesStores.get("first_name")?.value}</h1>
      <h1>Hello login success {cookiesStores.get("last_name")?.value}</h1>
      <h1>Hello login success {cookiesStores.get("student_id")?.value}</h1>
      <a href='/api/auth/signout'>signout</a>
    </>
  );
};

export default Profile;
