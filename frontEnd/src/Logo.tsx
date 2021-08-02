import React from 'react'
import logo from './testpng.png'

function Logo(): JSX.Element {
	return (
		<img id='logoImage'
		src={ logo } />
	)
}

export default Logo