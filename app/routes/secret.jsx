import { useLoaderData, Link } from "@remix-run/react"
import { prisma } from '~/utils/prisma.server'
//import { redirect } from "@remix-run/node";
import { requireUserId } from "~/utils/auth.server";

export const loader = async ({request}) => {
  await requireUserId(request);

  const data = {
    secrets: await prisma.secret.findMany({
      take: 20,
      select: { id: true, title: true, body: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  return data
}

export default function Secret() {
  const data = useLoaderData()
  return (
      
      <div className="content">
      <h2>SecretCodes</h2>
      <div className="formContainer">
      <div className="formSwitch">
        <form action="/logout" method="post">
	        <button type="submit"  className="btn-switch">
	    	  Logout
	        </button>
        </form>
      </div>    
        {data.secrets.map(secret => {
          return <div key={Math.random()}>
            <h3>{secret.title}</h3>
            <div>{secret.body.split(',').map(code => <p key={Math.random()}>{code}</p>)}</div>
            <small><b>Created at: </b>{new Date(secret.createdAt).toLocaleString()}</small>
          </div>
        })}
        <div className="index-form">
        <Link to="/"><button className="btn-back">Back</button></Link>
      </div>
      </div>
      </div>
  );
}
