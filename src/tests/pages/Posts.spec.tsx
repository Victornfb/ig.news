import { render, screen } from '@testing-library/react'
import { mocked } from 'jest-mock'
import Posts, { getStaticProps } from '../../pages/posts'
import { getPrismicClient } from '../../services/prismic'

const posts = [
	{
		slug: 'my-new-post',
		title: 'My new post',
		excerpt: 'Post excerpt',
		updatedAt: '04/06/2022',
	}
]

jest.mock('../../services/prismic')

describe('Posts page', () => {
	test('should render correctly', () => {
		render(<Posts posts={posts} />)

		expect(screen.getByText('My new post')).toBeInTheDocument()
	})

	test('should loads the initial data', async () => {
		const getPrismicClientMocked = mocked(getPrismicClient)

		getPrismicClientMocked.mockReturnValueOnce({
			query: jest.fn().mockResolvedValueOnce({
				results: [
					{
						uid: 'my-new-post',
						data: {
							title: [
								{ type: 'heading', text: 'My new post'}
							],
							content: [
								{ type: 'paragraph', text: 'Post excerpt'}
							],
						},
						last_publication_date: '2022-06-04 12:00:00',
					}
				]
			})
		} as any)

		const response = await getStaticProps({})

		expect(response).toEqual(
			expect.objectContaining({
				props: {
					posts: [{
						slug: 'my-new-post',
						title: 'My new post',
						excerpt: 'Post excerpt',
						updatedAt: '04 de junho de 2022'
					}]
				}
			})
		)
	})
})