// @vitest-environment nuxt
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import Portfolio from '~/components/portfolio/Portfolio.vue'

const makeItems = (count: number): PortfolioItem[] =>
    Array.from({ length: count }, (_, i) => ({
        id: String(i),
        title: `Project ${i}`,
        slug: `project-${i}`,
        url: `/proyectos/project-${i}`,
        excerpt: `Excerpt ${i}`,
        featuredImage: {
            id: String(i),
            src: `/img-${i}.jpg`,
            alt: `Project ${i}`,
            width: 800,
            height: 600,
        },
        taxonomies: {
            projectCategories: [{ slug: i % 2 === 0 ? 'web' : 'mobile', name: i % 2 === 0 ? 'Web' : 'Mobile' }],
        },
    }))

describe('Portfolio', () => {
    it('renders portfolio items from props', async () => {
        const wrapper = await mountSuspended(Portfolio, {
            props: {
                items: makeItems(3),
                layout: GalleryLayout.GRID,
            },
        })
        expect(wrapper.findAll('a')).toHaveLength(3)
    })

    it('shows empty message when no items', async () => {
        const wrapper = await mountSuspended(Portfolio, {
            props: {
                items: [],
                emptyText: 'Nothing here',
            },
        })
        expect(wrapper.text()).toContain('Nothing here')
    })

    it('renders correct number of items with pagination', async () => {
        const wrapper = await mountSuspended(Portfolio, {
            props: {
                items: makeItems(10),
                layout: GalleryLayout.GRID,
                paginationMode: GalleryPaginationMode.PAGINATION,
                pageSize: 3,
            },
        })
        expect(wrapper.findAll('a')).toHaveLength(3)
    })
})
