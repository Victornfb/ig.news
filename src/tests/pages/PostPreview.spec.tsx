import { render, screen } from '@testing-library/react'
import { mocked } from 'jest-mock'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Post, { getStaticProps } from '../../pages/posts/preview/[slug]'
import { getPrismicClient } from '../../services/prismic'

const post = {
	slug: 'my-new-post',
	title: 'My new post',
	content: '<p>Post excerpt</p>',
	updatedAt: '04/06/2022',
}

jest.mock('next-auth/react')
jest.mock('next/router')
jest.mock('../../services/prismic')

describe('Post preview page', () => {
	test('should render correctly', () => {
		const useSessionMocked = mocked(useSession)
		useSessionMocked.mockReturnValueOnce({data: null, status: "unauthenticated"})

		render(<Post post={post} />)

		expect(screen.getByText('My new post')).toBeInTheDocument()
		expect(screen.getByText('Post excerpt')).toBeInTheDocument()
		expect(screen.getByText('Wanna continue reading?')).toBeInTheDocument()
	})

	test('should redirect user to full post when has subscription', async () => {
		const useSessionMocked = mocked(useSession)
		const useRouterMocked = mocked(useRouter)
		const pushMocked = jest.fn()

		useSessionMocked.mockReturnValueOnce({
			data: {
				user: {
					name: 'Victor Nunes',
					email: 'victornfb@outlook.com',
				},
				expires: 'fake-expires',
				activeSubscription: 'fake-subscription',
			},
			status: "authenticated"
		})

		useRouterMocked.mockReturnValueOnce({
			push: pushMocked,
		} as any)

		render(<Post post={post} />)

		expect(pushMocked).toHaveBeenCalledWith('/posts/my-new-post')
	})

	test('should loads the initial data', async () => {
		const getPrismicClientMocked = mocked(getPrismicClient)

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

		const response = await getStaticProps({
			params: {
				slug: 'my-new-post',
			}
		})

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