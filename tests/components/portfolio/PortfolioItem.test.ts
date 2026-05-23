// @vitest-environment nuxt
import { mountSuspended } from '@nuxt/test-utils/runtime'
import PortfolioItem from '~/components/portfolio/PortfolioItem.vue'
import type { PortfolioItem as PortfolioItemType } from '~/models/types/portfolio'

const NuxtLinkStub = {
    template: '<a :href="to"><slot /></a>',
    props: ['to'],
}

const NuxtImgStub = {
    template: '<img :src="src" :alt="alt" />',
    props: ['src', 'alt', 'width', 'height', 'sizes', 'densities', 'loading'],
}

const makeItem = (overrides: Partial<PortfolioItemType> = {}): PortfolioItemType => ({
    id: '1',
    title: 'Test Project',
    slug: 'test-project',
    url: '/proyectos/test-project',
    excerpt: 'A test project description',
    featuredImage: {
        id: '1',
        src: '/test.jpg',
        alt: 'Test image',
        width: 800,
        height: 600,
    },
    taxonomies: {
        projectCategories: [{ slug: 'web', name: 'Web' }],
        tecnologias: [{ slug: 'vue', name: 'Vue' }],
    },
    ...overrides,
})

const factory = async (props: Record<string, unknown> = {}) =>
    mountSuspended(PortfolioItem, {
        props: { item: makeItem(), ...props },
        global: {
            stubs: {
                NuxtLink: NuxtLinkStub,
                NuxtImg: NuxtImgStub,
            },
        },
    })

describe('PortfolioItem', () => {
    it('renders the project title', async () => {
        const wrapper = await factory()
        expect(wrapper.text()).toContain('Test Project')
    })

    it('renders as a NuxtLink with correct URL', async () => {
        const wrapper = await factory()
        const link = wrapper.find('a')
        expect(link.exists()).toBe(true)
        expect(link.attributes('href')).toBe('/proyectos/test-project')
    })

    it('shows excerpt when showExcerpt is true', async () => {
        const wrapper = await factory({ showExcerpt: true })
        expect(wrapper.text()).toContain('A test project description')
    })

    it('hides excerpt when showExcerpt is false', async () => {
        const wrapper = await factory({ showExcerpt: false })
        expect(wrapper.text()).not.toContain('A test project description')
    })

    it('shows taxonomy badges when showTaxonomies is true', async () => {
        const wrapper = await factory({
            showTaxonomies: true,
            taxonomyToShow: 'projectCategories',
        })
        expect(wrapper.text()).toContain('Web')
    })

    it('renders NuxtImg with correct src and alt', async () => {
        const wrapper = await factory()
        const image = wrapper.find('img')
        expect(image.exists()).toBe(true)
        expect(image.attributes('alt')).toBe('Test image')
    })
})
