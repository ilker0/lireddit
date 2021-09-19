import React from 'react'
import { Form, Formik } from 'formik'
import Wrapper from '../components/Wrapper'
import InputField from '../components/InputField'
import { Box, Button } from '@chakra-ui/react'
import { useLoginMutation } from '../generated/graphql'
import { toErrorMap } from '../utils/toErrorMap'
import { useRouter } from 'next/dist/client/router'
import { withUrqlClient } from 'next-urql'
import { createUrqlClient } from '../utils/createUrqlClient'

const Login: React.FC<{}> = ({}) => {
  const [, login] = useLoginMutation()
  const router = useRouter()

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ username: '', password: '' }}
        onSubmit={async (values, { setErrors }) => {
          const response = await login({ options: values })

          if (response.data?.login.errors) {
            setErrors(toErrorMap(response.data.login.errors))
          } else if (response.data?.login.user) {
            router.push('/')
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField name="username" label="Username" placeholder="Username" />
            <Box mt={4}>
              <InputField name="password" label="Password" placeholder="Password" type="password" />
            </Box>

            <Button colorScheme="teal" isLoading={isSubmitting} type="submit" mt={4}>
              Login
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  )
}

export default withUrqlClient(createUrqlClient)(Login)
