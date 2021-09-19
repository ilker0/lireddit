import { Box } from '@chakra-ui/layout'
import { withUrqlClient } from 'next-urql'
import React from 'react'
import Navbar from '../components/Navbar'
import { usePostsQuery } from '../generated/graphql'
import { createUrqlClient } from '../utils/createUrqlClient'

const Index = () => {
  const [{ data }] = usePostsQuery()
  return (
    <Box>
      <Navbar />
      {!data ? null : data.posts.map((p) => <div key={p.id}>{p.title}</div>)}
    </Box>
  )
}

export default withUrqlClient(createUrqlClient)(Index)
