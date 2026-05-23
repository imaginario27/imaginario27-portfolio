// @vitest-environment nuxt
import { mountSuspended } from '@nuxt/test-utils/runtime'
import Portfolio from '~/components/portfolio/Portfolio.vue'
import type { PortfolioItem } from '~/models/types/portfolio'
import { GalleryLayout, GalleryPaginationMode } from '~/models/enums/gallery'

const NuxtLinkStub = {
    template: '<a :href="to"><slot /></a>',
    props: ['to'],
}

const NuxtImgStub = {
    template: '<img :src="src" :alt="alt" />',
    props: ['src', 'alt', 'width', 'height', 'sizes', 'densities', 'loading'],
}

const makeItems = (count: number): PortfolioItem[] =>
    Array.from({ length: count }, (_, index) => ({
        id: String(index),
        title: `Project ${index}`,
        slug: `project-${index}`,
        url: `/proyectos/project-${index}`,
        excerpt: `Excerpt ${index}`,
        featuredImage: {
            id: String(index),
            src: `/img-${index}.jpg`,
            alt: `Project ${index}`,
            width: 800,
            height: 600,
        },
        taxonomies: {
            projectCategories: [{ slug: index % 2 === 0 ? 'web' : 'mobile', name: index % 2 === 0 ? 'Web' : 'Mobile' }],
        },
    }))

const factory = async (props: Record<string, unknown> = {}) =>
    mountSuspended(Portfolio, {
        props,
        global: {
            stubs: {
                NuxtLink: NuxtLinkStub,
                NuxtImg: NuxtImgStub,
                GalleryFilter: true,
            },
        },
    })

describe('Portfolio', () => {
    it('renders portfolio items from props', async () => {
        const wrapper = await factory({
            items: makeItems(3),
            layout: GalleryLayout.GRID,
        })
        expect(wrapper.findAll('a')).toHaveLength(3)
    })

    it('shows empty message when no items', async () => {
        const wrapper = await factory({
            items: [],
            emptyText: 'Nothing here',
        })
        expect(wrapper.text()).toContain('Nothing here')
    })

    it('renders correct number of items with pagination', async () => {
        const wrapper = await factory({
            items: makeItems(10),
            layout: GalleryLayout.GRID,
            paginationMode: GalleryPaginationMode.PAGINATION,
            pageSize: 3,
        })
        expect(wrapper.findAll('a')).toHaveLength(3)
    })
})
