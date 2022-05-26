import { render, screen } from '@testing-library/react';
import { mocked } from 'jest-mock'
import { useSession } from 'next-auth/react';
import { SignInButton } from '.';

jest.mock('next-auth/react')

describe('SignInButton component', () => {
	test('should render correctly when user is not authenticated', () => {
		const useSessionMocked = mocked(useSession)
		useSessionMocked.mockReturnValueOnce({data: null, status: "unauthenticated"})

		render(
			<SignInButton/>
		)
	
		expect(screen.getByText('Sign In with Github')).toBeInTheDocument()
	})

	test('should render correctly when user is authenticated', () => {
		const useSessionMocked = mocked(useSession)
		useSessionMocked.mockReturnValueOnce({
			data: {
				user: {
					name: 'Victor Nunes',
					email: 'victornfb@outlook.com',
				},
				expires: 'fake-expires'
			},
			status: "authenticated"
		})

		render(
			<SignInButton/>
		)
	
		expect(screen.getByText('Victor Nunes')).toBeInTheDocument()
	})
})