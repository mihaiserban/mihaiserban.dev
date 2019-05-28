import React from 'react';
import { Link as glink, graphql } from 'gatsby';
import classNames from 'classnames';

import Link from '../components/link';
import Layout from '../components/layout';
import { H1 } from '../components/text/headings';

const Page = ({ data }) => {
  const { nodes: books } = data.allContentfulBook;

  return (
    <Layout>
      <div>
        <H1>Bookshelf</H1>
        <p className="mt16">
          I enjoy reading/listening to books and always curious what others are reading. Mostly I
          enjoy reading from categories such as Science Fiction or Personal Development. I thought
          I’d share my bookshelf here with you. The books that I particularly enjoyed are marked{' '}
          <span className="bold">bold</span>. The list is not in a particular order.
        </p>
        <p className="mt8">
          If you want to suggest a book send me an email at{' '}
          <a href="mailto:contact@mihaiserban.dev?subject=Book recommendation">
            contact@mihaiserban.dev
          </a>
        </p>
        <ul className="flex-parent flex-parent--column mt16 list">
          {books.map(book => (
            <Link to={book.url} key={book.id}>
              <li className={classNames({ fw6: book.favorite })}>{book.title}</li>
            </Link>
          ))}
        </ul>
      </div>
      <style jsx>
        {`
          .list {
            padding-left: 18px;
            list-style: square;
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
