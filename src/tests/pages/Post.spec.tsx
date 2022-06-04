import { render, screen } from '@testing-library/react'
import { mocked } from 'jest-mock'
import { getSession } from 'next-auth/react'
import Post, { getServerSideProps } from '../../pages/posts/[slug]'
import { getPrismicClient } from '../../services/prismic'

const post = {
	slug: 'my-new-post',
	title: 'My new post',
	content: '<p>Post content</p>',
	updatedAt: '04/06/2022',
}

jest.mock('next-auth/react')
jest.mock('../../services/prismic')

describe('Post page', () => {
	test('should render correctly', () => {
		render(<Post post={post} />)

		expect(screen.getByText('My new post')).toBeInTheDocument()
		expect(screen.getByText('Post content')).toBeInTheDocument()
	})

	test('should redirect user if no subscription is found', async () => {
		const getSessionMocked = mocked(getSession)

		getSessionMocked.mockResolvedValueOnce({
			activeSubscription: null,
		} as any)

		const response = await getServerSideProps({
			req: {
				cookies: {},
			},
			params: {
				slug: 'my-new-post',
			},
		} as any)

		expect(response).toEqual(
			expect.objectContaining({
				redirect: expect.objectContaining({
					destination: '/',
				})
			})
		)
	})

	test('should loads the initial data', async () => {
		const getSessionMocked = mocked(getSession)
		const getPrismicClientMocked = mocked(getPrismicClient)

		getSessionMocked.mockResolvedValueOnce({
			activeSubscription: 'fake-subscription',
		} as any)

		getPrismicClientMocked.mockReturnValueOnce({
			getByUID: jest.fn().mockResolvedValueOnce({
				data: {
					title: [
						{ type: 'heading', text: 'My new post'}
					],
					content: [
						{ type: 'paragraph', text: 'Post content'}
					],
				},
				last_publication_date: '2022-06-04 12:00:00',
			})
		} as any)

		const response = await getServerSideProps({
			params: {
				slug: 'my-new-post',
			},
		} as any)

		expect(response).toEqual(
			expect.objectContaining({
				props: {
					post: {
						slug: 'my-new-post',
						title: 'My new post',
						content: '<p>Post content</p>',
						updatedAt: '04 de junho de 2022',
					}
				}
			})
		)

	})
})