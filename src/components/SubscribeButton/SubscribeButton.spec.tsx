import { render, screen, fireEvent } from '@testing-library/react';
import { mocked } from 'jest-mock';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { SubscribeButton } from '.';

jest.mock('next-auth/react');
jest.mock('next/router');

describe('SubscribeButton component', () => {
	test('should render correctly', () => {
		const useSessionMocked = mocked(useSession)
		useSessionMocked.mockReturnValueOnce({data: null, status: "unauthenticated"})

		render(
			<SubscribeButton/>
		)
	
		expect(screen.getByText('Subscribe now')).toBeInTheDocument()
	})

	test('should redirect user to sign in when not authenticated', () => {
		const useSessionMocked = mocked(useSession)
		useSessionMocked.mockReturnValueOnce({data: null, status: "unauthenticated"})
		const signInMocked = mocked(signIn)

		render(<SubscribeButton/>)

		const subscribeButton = screen.getByText('Subscribe now')

		fireEvent.click(subscribeButton)
	
		expect(signInMocked).toHaveBeenCalled()
	})

	test('should redirect user to posts when user already has subscription', () => {
		const useRouterMocked = mocked(useRouter)
		const pushMocked = jest.fn()
		const useSessionMocked = mocked(useSession)
		useSessionMocked.mockReturnValueOnce({
			data: {
				user: {
					name: 'Victor Nunes',
					email: 'victornfb@outlook.com',
				},
				expires: 'fake-expires',
				activeSubscription: 'fake-active-subscription',
			},
			status: "authenticated"
		})

		useRouterMocked.mockReturnValueOnce({
			push: pushMocked,
		} as any)

		render(<SubscribeButton/>)

		const subscribeButton = screen.getByText('Subscribe now')

		fireEvent.click(subscribeButton)
	
		expect(pushMocked).toHaveBeenCalledWith('/posts')
	})
})