import { Link, useLoaderData } from "@remix-run/react"
import Rocket from '~/styles/rocket.svg';
import { prisma } from "../utils/prisma.server";

export const loader = async () => {
  const countCodes = await prisma.secret.count()
  console.log('Number of code in database: ', countCodes)
  return { numCodes: countCodes }
}
export default function Secret() {

  const data = useLoaderData()

  return (
    <div className="content">
      <h1>WELCOME</h1>
      <div className="formContainer">
        <h3>A simple  Remix demo</h3>
        <p>Launch codes in database: {data.numCodes}</p>
        <img className="rocket" src={Rocket} alt="rocket" />
        <div className="index-form">
          <Link to="/secret"><button className="btn-view">View launch codes</button></Link>
        </div>
      </div>
    </div>
  );
}
