import { json } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useSubmit, useTransition } from "@remix-run/react"
import { useEffect, useRef } from "react";
import { validateUsername, validatePassword, validateEmail } from "../../utils/validate";
import { login, register, getUser } from '~/utils/auth.server'

export const loader = async () => {
  return { title: 'RemixLogin' }
}

export const action = async ({ request }) => {
  const formData = await request.formData()
  const { _action } = Object.fromEntries(formData)
  const username = formData.get('username')
  const password = formData.get('password')
  const email = formData.get('email')
  const errorCheckLogin = formData.get('errorCheckLogin')
  const errorCheckRegister = formData.get('errorCheckRegister')

  if (_action === "reg") return { fields: { formType: 'register' } }

  if (_action === "log") return { fields: { formType: 'login' } }

  if (_action === "login" || errorCheckLogin) {
    const fields = { formType: 'login', username, password }

    const fieldErrors = {
      username: validateUsername(username),
      password: validatePassword(password),
    }

    if (Object.values(fieldErrors).some(Boolean)) {
      if (errorCheckLogin) {
        return json({ fieldErrors, fields, })
      } else {
        return json({ fieldErrors, fields }, { status: 400 })
      }
    }

    // if no error and checking is done (to show field data, so form is not automatically submitted)
    if (errorCheckLogin) {
      return { fields, checkingCompleted: true }
    }

    //when sent, return sent:true so useEffect resets form
    // HERE  LOGIN IN SHOULD BE DONE
    return await login({ username, password })
    //return {fields, sent: true}
  }

  if (_action === "register" || errorCheckRegister) {
    const fields = { formType: 'register', username, password, email }

    const fieldErrors = {
      username: validateUsername(username),
      password: validatePassword(password),
      email: validateEmail(email)
    }

    if (Object.values(fieldErrors).some(Boolean)) {
      if (errorCheckRegister) {
        return json({ fieldErrors, fields })
      } else {
        return json({ fieldErrors, fields }, { status: 400 })
      }
    }

    if (errorCheckRegister) {
      return { fields, checkingCompleted: true }
    }

    // HERE ADDING TO DATABASE
    // register function return {sent: true} useEffect resets form (that way login is automatically shown)
    // register function validates data and calls createUser that saves new user to database
    return await register({ username, password, email })

    // maybe remove this
    //return {fields: {formType: 'login', username, password, email}, sent: true}
  }

}

const Login = () => {
  const formRef = useRef()
  const data = useLoaderData()
  const actionData = useActionData()
  const submit = useSubmit()
  let transition = useTransition()

  let isAdding = transition.state === "submitting" &&
    (transition.submission.formData.get("_action") === 'log' || transition.submission.formData.get("_action") === 'reg')

  // clear form after submission and when checking if formErrors "are gone"
  useEffect(() => {
    formRef.current?.reset()
  }, [actionData?.sent, submit])

  // clear form when changing from LOGIN to REGISTER
  useEffect(() => {
    if (!isAdding) {
      formRef.current?.reset()
    }
  }, [isAdding])

  const handleSubmit = (typeError) => {
    const formData = new FormData(formRef.current)
    typeError === 'login' ? formData.set('errorCheckLogin', true) : formData.set('errorCheckRegister', true)
    submit(formData, { method: "post" });
  };

  return (
    <div className="content">
      <h2>{data.title}</h2>
      <div className="formContainer2">
        <div className="formSwitch">
          <Form method="post">
            <button className="btn-switch" name="_action" value={!actionData?.fields?.formType || actionData?.fields?.formType === 'login' ? 'reg' : 'log'}>{actionData?.fields?.formType === 'register' ? 'LOGIN' : 'REGISTER'}</button>
          </Form>
        </div>
        <h3>{actionData?.fields?.formType === 'register' ? 'REGISTER' : 'LOGIN'}</h3>
        {actionData?.error ? <div className="error">{actionData.error}</div> : null}
        <Form ref={formRef} method="post">
          <div className="form-control">
            <label htmlFor="username">Username</label>
            <input
              autoComplete="off"
              type="text"
              name="username"
              defaultValue={actionData?.fieldErrors || actionData?.checkingCompleted ? actionData?.fields?.username : null}
              // because username in both login & register fields send 'login' or 'register' to handleSubmit
              onChange={actionData?.fieldErrors?.username ? () => handleSubmit(actionData?.fields?.formType === 'login' ? 'login' : 'register') : null}
            />
            {actionData?.fieldErrors ? <div className="error">{actionData.fieldErrors.username}</div> : null}
          </div>
          <div className="form-control">
            <label htmlFor="password">Password</label>
            <input
              autoComplete="off"
              type="password"
              name="password"
              defaultValue={actionData?.fieldErrors || actionData?.checkingCompleted ? actionData?.fields?.password : null}
              // because password in both login & register fields send 'login' or 'register' to handleSubmit
              onChange={actionData?.fieldErrors?.password ? () => handleSubmit(actionData?.fields?.formType === 'login' ? 'login' : 'register') : null}
            />
            {actionData?.fieldErrors ? <div className="error">{actionData.fieldErrors.password}</div> : null}
          </div>
          {actionData?.fields?.formType === 'register' &&
            <div className="form-control">
              <label htmlFor="email">Email</label>
              <input
                autoComplete="off"
                type="text"
                name="email"
                defaultValue={actionData?.fieldErrors || actionData?.checkingCompleted ? actionData?.fields?.email : null}
                onChange={actionData?.fieldErrors?.email ? () => handleSubmit('register') : null}
              />
              {actionData?.fieldErrors ? <div className="error">{actionData.fieldErrors.email}</div> : null}
            </div>
          }
          <button className="btn-send" name="_action" value={actionData?.fields?.formType === 'register' ? 'register' : 'login'}>{actionData?.fields?.formType === 'register' ? 'REGISTER' : 'LOGIN'}</button>
        </Form>
      </div>
      <div className="form-data-header">STATE MACHINE WITH FORMDATA</div>
      <div className="form-data-info">JSON.stringify() to show form state</div>
      <div className="form-data">{actionData?.formType || actionData?.fieldsErrors || actionData?.fields ? JSON.stringify(actionData) : <>&nbsp;</>}</div>
    </div>
  )
}

export default Login