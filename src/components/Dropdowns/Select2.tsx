import Select, {Props} from "react-select";

export type BookType = {
    id: string
    name: string
    author: string
    publisher: string
}

export function BookSelect({books, defaultBook}:{books:BookType[], defaultBook?:BookType}) {

   const selectProps: Props<BookType, false> =
	{
		options: books, // a list of objects in our case of Books
		onChange: (book) => {
			if (!book) {
				return;
			}
			console.log(`The book ${book.name} was chosen`);
		},
		getOptionLabel: (book) => book.name, // label definition
		getOptionValue: (book) => book.id, // value definition
		// not defaultValue otherwise, it does not rerender
		value: defaultBook // default value
	}
   return (
	<Select<BookType, false> {...selectProps}/>
   )
}