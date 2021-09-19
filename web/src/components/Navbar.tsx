import React from 'react'
import { Box, Flex, Link } from '@chakra-ui/layout'
import NextLink from 'next/link'
import { useLogoutMutation, useMeQuery } from '../generated/graphql'
import { Button } from '@chakra-ui/button'

const Navbar: React.FC<{}> = ({}) => {
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation()
  const [{ data, fetching }] = useMeQuery()

  let body = null

  if (fetching) {
    body = null
  } else if (!data?.me) {
    body = (
      <>
        <NextLink href="/login">
          <Link color="white" mr={2}>
            Login
          </Link>
        </NextLink>
        <NextLink href="/register">
          <Link color="white">Register</Link>
        </NextLink>
      </>
    )
  } else {
    body = (
      <Flex alignItems="center">
        <Box mr={2}>{data.me.username}</Box>
        <Button
          onClick={() => {
            logout()
          }}
          isLoading={logoutFetching}
          colorScheme="teal"
          variant="solid"
        >
          Logout
        </Button>
      </Flex>
    )
  }

  return (
    <Flex ml="auto" p={4} bg="tan">
      <Box ml="auto">{body}</Box>
    </Flex>
  )
}

export default Navbar
