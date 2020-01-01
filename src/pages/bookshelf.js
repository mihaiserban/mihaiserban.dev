import React from 'react';
import { Link as glink, graphql } from 'gatsby';
import classNames from 'classnames';

import Link from '../components/link';
import Layout from '../components/layout';

const Page = ({ data }) => {
  const { nodes: books } = data.allContentfulBook;

  return (
    <Layout>
      <div>
        <h1>Bookshelf</h1>
        <p className="mt16">
          I enjoy reading/listening to books and always curious what others are reading. Mostly I
          enjoy reading from categories such as Science Fiction or Personal Development. I thought
          I’d share my bookshelf here with you. The books that I particularly enjoyed are marked{' '}
          <span className="bold">bold</span>. The list is not in a particular order.
        </p>
        <p className="mt8">
          If you want to suggest a book send me an{' '}
          <a href={`mailto:${process.env.GATSBY_EMAIL}?subject=Book recommendation`}>email.</a>
        </p>
        <ul className="flex-parent flex-parent--column mt16 list">
          {books.map(book => (
            <Link to={book.url} key={book.id}>
              <li className={classNames({ bold: book.favorite })}>{book.title}</li>
            </Link>
          ))}
        </ul>
      </div>
      <style jsx>
        {`
          .list {
            padding-left: 0px;
            margin: 0px;
            list-style: none;
          }
          .list li {
            margin: 0px;
          }
        `}
      </style>
    </Layout>
  );
};

export default Page;

export const pageQuery = graphql`
  query BooksQuery {
    allContentfulBook(sort: { fields: [title], order: ASC }) {
      nodes {
        id
        title
        url
        favorite
      }
    }
  }
`;
