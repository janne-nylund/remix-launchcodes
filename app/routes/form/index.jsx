import { useActionData, Form, useSubmit } from "@remix-run/react";

export const action = async ({ request }) => {
  const formData = await request.formData();
  const {_action, ...values} = Object.fromEntries(formData)

  switch (_action) {
    case "manualSubmit": {
      return { ...values}
    }
    case "toggle": {
      return { ...values, formStatus: values.formStatus === 'visible' ? 'hidden' : 'visible'}
    }
    case "step1": {
      return { ...values, step: `step1` };
    }
    case "step2":{
      return { ...values, step: `step2` };
    }
    case "step3":{
      return { ...values, step: `step3` };
    }
    default:
      throw new Error("YO!?");
  }
};

export default function Login() {
  const actionData = useActionData();
  const submit = useSubmit()

  const handleClick = (e) => {
    e.preventDefault()
    const formData = new FormData()
    
    formData.set('_action', 'manualSubmit')
    formData.set('name', 'Anne')
    formData.set('password', 'secret123')
    for(const pair of formData.entries()) {
      console.log(`${pair[0]}, ${pair[1]}`);
    }
    submit(formData, { method: "post"}); 
  }


  return (
    <div>
      <h1>Form</h1>
      <p>{JSON.stringify(actionData)}</p>
      <Form method="post">
        <button type="submit" name="_action" value='toggle'>Toggle</button>
        <div hidden={
            !actionData?.formStatus || actionData?.formStatus === 'hidden' ? "hidden" : null 
          }>
        <div
          hidden={
            !actionData?.step || actionData?.step === "step1" ? null : "hidden"
          }
        >
          {/* hidden inputs to hold "state" of formStatus and step */}
          <input type="hidden" name="formStatus" defaultValue={actionData?.formStatus}/>
          <input type="hidden" name="step" defaultValue={actionData?.step}/>

          <h2>Step 1</h2>
          <button type="submit" name="_action" value="step2">
            Step 2
          </button>
        </div>
        <div hidden={actionData?.step === "step2" ? null : "hidden"}>
          <h2>Step 2</h2>
          <button type="submit" name="_action" value="step1">
            Step 1
          </button>
          <button name="_action" value="step3">
            Step 3
          </button>
        </div>
        <div hidden={actionData?.step === "step3" ? null : "hidden"}>
          <h2>Step 3</h2>
          <button type="submit" name="_action" value="step2">
            Step 2
          </button>
          <button name="_action" value="step1">
            Submit
          </button>
        </div>
        </div>
      </Form>
      <form>
        <button onClick={(e) => handleClick(e)}>Hello</button>
      </form>
    </div>
  );
}