import { render, screen } from '@testing-library/react';
import { ActiveLink } from '.';

jest.mock('next/router', () => {
	return {
		useRouter() {
			return {
				asPath: '/'
			}
		}
	}
})

describe('ActiveLink component', () => {
	test('should render correctly', () => {
		render(
			<ActiveLink href="/" activeClassName='active'>
				<a>Home</a>
			</ActiveLink>
		)
	
		expect(screen.getByText('Home')).toBeInTheDocument()
	})
	
	test('should receive active class', () => {
		render(
			<ActiveLink href="/" activeClassName='active'>
				<a>Home</a>
			</ActiveLink>
		)
	
		expect(screen.getByText('Home')).toHaveClass('active')
	})
})